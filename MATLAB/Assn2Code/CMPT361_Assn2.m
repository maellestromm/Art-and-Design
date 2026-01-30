% Maelle McCallum
% CMPT 361 D100
% mvm3

%% 1: FAST feature detector %%

% Function to use FAST to detect features
function fastIm = my_fast_detector(img, t, circXY, N)

    % Initializing necessary variables
    imgG = im2gray(img);
    circ1 = {16};
    circ2 = {16};
    corners = zeros(size(circ1{1})); 
    
    % Compute and store bright/dark intensity differences 
    for i = 1:16
        circ1{i} = imgG + t < imtranslate(imgG, circXY(i,:));
        circ2{i} = imgG - t > imtranslate(imgG, circXY(i,:));
    end

    % Check if there is a set of N contiguous values that satisfy:
    for i = 1:16
        % condition 1 (brightness) or condition 2 (darkness)
        cond1 = ones(size(corners), 'logical');
        cond2 = ones(size(corners), 'logical');

        % Use circshift() to check N contiguous values
        for j = 0:N-1
            shifted_circ1 = circshift(circ1, -j);
            shifted_circ2 = circshift(circ2, -j);
            cond1 = cond1 & shifted_circ1{i};
            cond2 = cond2 & shifted_circ2{i};
        end

        % Store corners that fulfill cond1 or cond2
        corners = corners + cond1;
        corners = corners + cond2;
    end
    
    % Get locations of all detected edges
    [row, col] = find(corners);
    
    % Return in (x,y) format
    fastIm = [col, row];
end

% Creating matrix of coordinates for Bresenham circle of radius 3
quad2 = [3 0; 3 1; 2 2; 1 3];
quad3 = flip(quad2,2);
quad3(:,1)=quad3(:,1)*-1;
quad4 = quad2 * -1;
quad1 = quad3 * -1;
circleXY = [quad1; quad2; quad3; quad4];

% Read all images
img1a = im2double(imread('S1-im1.png'));
img1b = im2double(imread('S1-im2.png'));

img2a = im2double(imread('S2-im1.png'));
img2b = im2double(imread('S2-im2.png'));

img3a = im2double(imread('S3-im1.png'));
img3b = im2double(imread('S3-im2.png'));
img3c = im2double(imread('S3-im3.png'));
img3d = im2double(imread('S3-im4.png'));

img4a = im2double(imread('S4-im1.png'));
img4b = im2double(imread('S4-im2.png'));
img4c = im2double(imread('S4-im3.png'));
img4d = im2double(imread('S4-im4.png'));

fastThresh = 0.15;

% time for all: 8.29s / 12 imgs = 0.69s per img
%tStart = cputime;

img1aFast = my_fast_detector(img1a, fastThresh, circleXY, 12);
img1bFast = my_fast_detector(img1b, fastThresh, circleXY, 12);

img2aFast = my_fast_detector(img2a, fastThresh, circleXY, 12);
img2bFast = my_fast_detector(img2b, fastThresh, circleXY, 12);

%{
img3aFast = my_fast_detector(img3a, fastThresh, circleXY, 12);
img3bFast = my_fast_detector(img3b, fastThresh, circleXY, 12);
img3cFast = my_fast_detector(img3c, fastThresh, circleXY, 12);
img3dFast = my_fast_detector(img3d, fastThresh, circleXY, 12);

img4aFast = my_fast_detector(img4a, fastThresh, circleXY, 12);
img4bFast = my_fast_detector(img4b, fastThresh, circleXY, 12);
img4cFast = my_fast_detector(img4c, fastThresh, circleXY, 12);
img4dFast = my_fast_detector(img4d, fastThresh, circleXY, 12);
%}

%tEnd=cputime-tStart

imwrite(insertMarker(img1a, img1aFast, 'o'), 'S1-fast.png');
imwrite(insertMarker(img2a, img2aFast, 'o'), 'S2-fast.png');

%% 2: Robust FAST using Harris Cornerness metric %%

function fastR = my_fast_detector_harris(img, t, circXY, N)

    % Initializing necessary variables
    imgG = im2gray(img);
    circ1 = {16};
    circ2 = {16};
    corners = zeros(size(circ1{1})); 
    ht = 0.001;
    
    % Compute and store bright/dark intensity differences 
    for i = 1:16
        circ1{i} = imgG + t < imtranslate(imgG, circXY(i,:));
        circ2{i} = imgG - t > imtranslate(imgG, circXY(i,:));
    end

    % Check if there is a set of N contiguous values that satisfy:
    for i = 1:16
        % condition 1 (brightness) or condition 2 (darkness)
        cond1 = ones(size(corners), 'logical');
        cond2 = ones(size(corners), 'logical');

        % Use circshift() to check N contiguous values
        for j = 0:N-1
            shifted_circ1 = circshift(circ1, -j);
            shifted_circ2 = circshift(circ2, -j);
            cond1 = cond1 & shifted_circ1{i};
            cond2 = cond2 & shifted_circ2{i};
        end

        % Store corners that fulfill cond1 or cond2
        corners = corners + cond1;
        corners = corners + cond2;
    end
    
    % Get locations of all detected edges
    [row, col] = find(corners);
    n = numel(row);
    harrisVals = zeros(n, 1);
    
    % Compute harris values for each corner
     for i=1:n
        x = col(i);
        y = row(i);
        
        % Construct 3x3 window
        window = img(max(y-1, 1):min(y+1, end), max(x-1, 1):min(x+1, end));
        [Ix, Iy] = gradient(window);

        % Compute values for the structure tensor
        Ix2 = sum(sum(Ix.^2));
        Iy2 = sum(sum(Iy.^2));
        Ixy = sum(sum(Ix .* Iy));
        
        % Compose structure tensor
        M = [Ix2, Ixy; Ixy, Iy2];

        % Harris response
        harrisVals(i) = det(M) - 0.04 * (trace(M)^2);
    end
    
    % Retain only the strongest harris values
    strong = harrisVals > ht;
    row = row(strong);
    col = col(strong);
    
    fastR = [col, row];
end

% 7.68s / 12 imgs = 0.64s per img
%tStart = cputime;

img1aFastR = my_fast_detector_harris(img1a, fastThresh, circleXY,12);
img1bFastR = my_fast_detector_harris(img1b, fastThresh, circleXY,12);

img2aFastR = my_fast_detector_harris(img2a, fastThresh, circleXY,12);
img2bFastR = my_fast_detector_harris(img2b, fastThresh, circleXY,12);

%{
img3aFastR = my_fast_detector_harris(img3a, fastThresh, circleXY, 12);
img3bFastR = my_fast_detector_harris(img3b, fastThresh, circleXY, 12);
img3cFastR = my_fast_detector_harris(img3c, fastThresh, circleXY, 12);
img3dFastR = my_fast_detector_harris(img3d, fastThresh, circleXY, 12);

img4aFastR = my_fast_detector_harris(img4a, fastThresh, circleXY, 12);
img4bFastR = my_fast_detector_harris(img4b, fastThresh, circleXY, 12);
img4cFastR = my_fast_detector_harris(img4c, fastThresh, circleXY, 12);
img4dFastR = my_fast_detector_harris(img4d, fastThresh, circleXY, 12);
%}

%tEnd=cputime-tStart

imwrite(insertMarker(img1a, img1aFastR, 'o'), "S1-fastR.png");
imwrite(insertMarker(img2a, img2aFastR, 'o'), "S2-fastR.png");

%% 3: Point description and matching %%

% 0.51s to compute
[pic1,corners1] = extractFeatures(im2gray(img1a),img1aFast, 'Method', 'SURF');
[pic2,corners2] = extractFeatures(im2gray(img1b),img1bFast, 'Method', 'SURF');
[pic3,corners3] = extractFeatures(im2gray(img2a),img2aFast, 'Method', 'SURF');
[pic4,corners4] = extractFeatures(im2gray(img2b),img2bFast, 'Method', 'SURF');

matchedPics1 = matchFeatures(pic1,pic2);
matchedCorners1 = corners1(matchedPics1(:,1));
matchedCorners2 = corners2(matchedPics1(:,2));
matchedPics2 = matchFeatures(pic3,pic4);
matchedCorners3 = corners3(matchedPics2(:,1));
matchedCorners4 = corners4(matchedPics2(:,2));

% 0.26s to compute
[pic1R,corners1R] = extractFeatures(im2gray(img1a),img1aFastR, 'Method', 'SURF');
[pic2R,corners2R] = extractFeatures(im2gray(img1b),img1bFastR, 'Method', 'SURF');
[pic3R,corners3R] = extractFeatures(im2gray(img2a),img2aFastR, 'Method', 'SURF');
[pic4R,corners4R] = extractFeatures(im2gray(img2b),img2bFastR, 'Method', 'SURF');

matchedPics1R = matchFeatures(pic1R,pic2R);
matchedCorners1R = corners1R(matchedPics1R(:,1));
matchedCorners2R = corners2R(matchedPics1R(:,2));
matchedPics2R = matchFeatures(pic3R,pic4R);
matchedCorners3R = corners3R(matchedPics2R(:,1));
matchedCorners4R = corners4R(matchedPics2R(:,2));

saveas((showMatchedFeatures(img1a,img1b,matchedCorners1,matchedCorners2,"montag")), 'S1-fastMatch.png');
saveas((showMatchedFeatures(img1a,img1b,matchedCorners1R,matchedCorners2R,"montag")), 'S1-fastRMatch.png');
saveas((showMatchedFeatures(img2a,img2b,matchedCorners3,matchedCorners4,"montag")), 'S2-fastMatch.png');
saveas((showMatchedFeatures(img2a,img2b,matchedCorners3R,matchedCorners4R,"montag")), 'S2-fastRMatch.png');

%% 4: RANSAC and Panoramas %%

function pano = my_panorama_maker(images, trials, t, circXY, N)
    numImages = numel(images);

    grayImage = im2gray(cell2mat(images(1)));
    points = my_fast_detector_harris(grayImage,t,circXY,N);
    %points = my_fast_detector(grayImage,t,circXY,N);
    [features,points] = extractFeatures(grayImage,points);
    tforms(numImages) = projtform2d;
    imageSize = zeros(numImages,2);

    for n = 2:numImages
        pointsPrevious = points;
        featuresPrevious = features;
        
        I = cell2mat(images(n));
        grayImage = im2gray(I);    
        imageSize(n,:) = size(grayImage);
    
        points = my_fast_detector_harris(grayImage,t,circXY,N);
        %points = my_fast_detector(grayImage,t,circXY,N);

        [features,points] = extractFeatures(grayImage,points);
  
        indexPairs = matchFeatures(features,featuresPrevious,Unique=true);
        matchedPoints = points(indexPairs(:,1), :);
        matchedPointsPrev = pointsPrevious(indexPairs(:,2), :);        
    
        tforms(n) = estgeotform2d(matchedPoints, matchedPointsPrev,...
            "projective",Confidence=99.9,MaxNumTrials=trials);
    
        tforms(n).A = tforms(n-1).A * tforms(n).A; 
    end

    for idx = 1:numel(tforms)           
        [xlim(idx,:),ylim(idx,:)] = outputLimits(tforms(idx),[1 imageSize(idx,2)],[1 imageSize(idx,1)]);    
    end
    
    avgXLim = mean(xlim, 2);
    [~,idx] = sort(avgXLim);
    centerIdx = floor((numel(tforms)+1)/2);
    centerImageIdx = idx(centerIdx);

    Tinv = invert(tforms(centerImageIdx));
    for idx = 1:numel(tforms)    
        tforms(idx).A = Tinv.A * tforms(idx).A;
    end

    for idx = 1:numel(tforms)           
        [xlim(idx,:),ylim(idx,:)] = outputLimits(tforms(idx),[1 imageSize(idx,2)],[1 imageSize(idx,1)]);
    end
    
    maxImageSize = max(imageSize);

    xMin = min([1; xlim(:)]);
    xMax = max([maxImageSize(2); xlim(:)]);
    yMin = min([1; ylim(:)]);
    yMax = max([maxImageSize(1); ylim(:)]);

    width  = round(xMax - xMin);
    height = round(yMax - yMin);

    panorama = zeros([height width 3],"like",I);

    xLimits = [xMin xMax];
    yLimits = [yMin yMax];
    panoramaView = imref2d([height width],xLimits,yLimits);

    for idx = 1:numImages
        I = cell2mat(images(idx));   
        warpedImage = imwarp(I,tforms(idx),OutputView=panoramaView);                 
        mask = imwarp(true(size(I,1),size(I,2)),tforms(idx),OutputView=panoramaView);
        panorama = imblend(warpedImage,panorama,mask,foregroundopacity=1);
    end

    pano = panorama;
end

trials = 50;
trialsR = 700;

images1 = {img1a,img1b};
%imshow(my_panorama_maker(images1,trials,fastThresh,circleXY,12))
imwrite(my_panorama_maker(images1,trialsR,fastThresh,circleXY,12),"S1-panorama.png");

images2 = {img2a,img2b};
%imshow(my_panorama_maker(images2,trialsR,fastThresh, circleXY, 12))
imwrite(my_panorama_maker(images2,trialsR,fastThresh,circleXY,12),"S2-panorama.png");

%images3 = {img3a,img3c,img3d,img3b};
images3 = {img3d,img3a};
%imshow(my_panorama_maker(images3,trialsR,fastThresh,circleXY,12))
imwrite(my_panorama_maker(images3,trialsR,fastThresh,circleXY,12),"S3-panorama.png");

%images4 = {img4d,img4c,img4b,img4a};
images4 = {img4b,img4a};
%imshow(my_panorama_maker(images4,trialsR,fastThresh,circleXY,12))
imwrite(my_panorama_maker(images4,trialsR,fastThresh,circleXY,12),"S4-panorama.png");

%% 5: Stitch 4 images instead of 2 %%

images3 = {img3a,img3c,img3d,img3b};
%imshow(my_panorama_maker(images3,trialsR,fastThresh,circleXY,12))
imwrite(my_panorama_maker(images3,trialsR,fastThresh,circleXY,12),"S1-largepanorama.png");

images4 = {img4d,img4c,img4b,img4a};
%imshow(my_panorama_maker(images4,trialsR,fastThresh,circleXY,12))
imwrite(my_panorama_maker(images4,trialsR,fastThresh,circleXY,12),"S2-largepanorama.png");
