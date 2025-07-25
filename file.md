        <div className="w-full ">
          <Masonry
            breakpointCols={breakpointCols}
            className={`flex w-[90%] my-masonry-grid`}
            columnClassName="my-masonry-grid_column"
          >
            {displayed.map((img) => (
              <div key={img.id} className="cursor-pointer p-[0.001rem]">
                <ImageCard
                  imageId={img.id.toString()}
                  src={img.url}
                  alt={img.alt}
                  author={img.author}
                  prompt={img.description}
                  initialLikeCount={img.initialLikeCount}
                  initialIsLiked={img.initialIsLiked}
                  isAuthenticated={userExists}
                  handleOnClick={() => handleClick(img.id)}
                  handleOnSearch={() =>
                    handleSearch(img.search_text ?? "", img.tags)
                  }
                />
              </div>
            ))}
          </Masonry>
